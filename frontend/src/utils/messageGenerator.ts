import { UpcomingEvent, MessageTemplate } from '../types';

export function interpolateString(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const reg = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(reg, value || '');
  }
  return result;
}

export function generateEventMessage(
  event: UpcomingEvent,
  templates: MessageTemplate[],
  channel: 'WHATSAPP' | 'EMAIL',
  companyName: string = 'Enlace CRM'
): { subject: string; body: string } {
  const currentYear = String(new Date().getFullYear());
  const isClientBirthday = event.type === 'CLIENT_BIRTHDAY';
  const isFamilyBirthday = event.type === 'FAMILY_BIRTHDAY';
  const isFixedDate = event.type === 'FIXED_DATE';

  // Identificar nome do homenageado e primeiro nome
  const targetFullName = event.targetName || event.clientName || 'Cliente';
  const targetFirstName = targetFullName.split(' ')[0];
  const clientFirstName = (event.clientName || targetFullName).split(' ')[0];

  // Localizar template customizado se houver
  const matchedTpl = templates.find((t) => {
    if (t.channel !== channel) return false;
    if (isClientBirthday) return t.eventType === 'CLIENT_BIRTHDAY';
    if (isFamilyBirthday) return t.eventType === 'FAMILY_BIRTHDAY';
    if (isFixedDate) {
      return (
        t.eventType === 'FIXED_DATE' &&
        (t.commemorativeDateId === event.commemorativeDateId ||
          t.name.toLowerCase().includes(event.title.toLowerCase()))
      );
    }
    return false;
  });

  // Mensagens padrão elegantes e calorosas
  let defaultSubject = `🎉 Votos Especiais — ${companyName}`;
  let defaultBody = '';

  if (isClientBirthday) {
    defaultSubject = `🎂 Feliz Aniversário, ${targetFirstName}! — ${companyName}`;
    defaultBody =
      channel === 'WHATSAPP'
        ? `Olá, ${targetFirstName}! 🎉🎂\n\nHoje é um dia muito especial! Toda a equipe da ${companyName} deseja a você um feliz aniversário, com muita saúde, paz, prosperidade e momentos inesquecíveis!\n\nÉ um imenso privilégio ter você como nosso cliente. Parabéns pelo seu dia! ✨🎈`
        : `Prezado(a) ${targetFullName},\n\nHoje é um dia de muita celebração! 🎂✨\n\nToda a equipe da ${companyName} deseja a você um Feliz Aniversário, com muita saúde, prosperidade e realizações!\n\nAtenciosamente,\nEquipe ${companyName}`;
  } else if (isFamilyBirthday) {
    defaultSubject = `💐 Feliz Aniversário, ${targetFirstName}! — ${companyName}`;
    defaultBody =
      channel === 'WHATSAPP'
        ? `Olá, ${targetFirstName}! 💐🎂\n\nHoje é o seu dia especial! Toda a equipe da ${companyName} deseja a você um feliz aniversário, com muita saúde, paz, alegria e momentos inesquecíveis!\n\nQue seu novo ciclo seja repleto de celebrações e carinho ao lado de toda a sua família. Parabéns pelo seu dia! ✨🎈`
        : `Prezada(o) ${targetFullName},\n\nHoje é um dia de celebração! 🎂✨\n\nToda a equipe da ${companyName} deseja a você um Feliz Aniversário, com muita saúde, paz e realizações ao lado de toda a família!\n\nCordialmente,\nEquipe ${companyName}`;
  } else {
    // Data Comemorativa Fixa / Feriado
    defaultSubject = `🌟 Feliz ${event.title} — ${companyName}`;
    defaultBody =
      channel === 'WHATSAPP'
        ? `Olá, ${targetFirstName}! ✨\n\nNeste(a) *${event.title}*, a equipe da ${companyName} deseja a você e sua família um dia maravilhoso, repleto de momentos especiais, saúde e alegria!\n\nUm grande abraço! 🌟`
        : `Prezado(a) ${targetFullName},\n\nEm celebração ao(à) ${event.title}, a ${companyName} deseja a você um excelente dia, com harmonia e realizações.\n\nCordialmente,\nEquipe ${companyName}`;
  }

  const rawSubject = matchedTpl?.subject || defaultSubject;
  const rawBody = matchedTpl?.content || defaultBody;

  const vars = {
    nome_cliente: event.clientName || targetFullName,
    primeiro_nome: targetFirstName,
    nome_familiar: targetFullName,
    nome_homenageado: targetFullName,
    primeiro_nome_homenageado: targetFirstName,
    parentesco: event.relationship || 'familiar',
    nome_empresa: companyName,
    ano_atual: currentYear,
  };

  return {
    subject: interpolateString(rawSubject, vars),
    body: interpolateString(rawBody, vars),
  };
}
