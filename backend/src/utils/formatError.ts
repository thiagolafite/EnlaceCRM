import { AppError } from './AppError';

export interface FormattedErrorResponse {
  error: string;
  solution: string;
  requestId: string;
  timestamp: string;
  details?: any;
}

/**
 * Tradutor e formatador de erros para mensagens direcionais e amigáveis ao usuário
 */
export function formatErrorForResponse(err: any, requestId: string): { status: number; body: FormattedErrorResponse } {
  const timestamp = new Date().toISOString();

  // 1. Erros customizados tipados da aplicação (AppError)
  if (err instanceof AppError) {
    let solution = 'Verifique os dados informados e tente novamente.';
    
    if (err.statusCode === 401) {
      solution = 'Verifique seu e-mail e senha. Se sua conta for nova, aguarde a liberação pelo administrador Master.';
    } else if (err.statusCode === 403) {
      solution = 'Seu perfil atual não tem permissão para esta ação. Solicite acesso ao administrador da sua empresa ou Master.';
    } else if (err.statusCode === 404) {
      solution = 'O item solicitado não existe ou foi removido. Atualize a página e selecione um registro válido.';
    } else if (err.statusCode === 400 && err.message.includes('Limite de clientes')) {
      solution = 'Acesse as configurações da empresa ou contate o suporte comercial para fazer upgrade do seu plano.';
    }

    return {
      status: err.statusCode,
      body: {
        error: err.message,
        solution,
        requestId,
        timestamp,
        details: err.details,
      },
    };
  }

  // 2. Erros conhecidos do Prisma ORM
  if (err?.code) {
    switch (err.code) {
      case 'P2002': {
        const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'campo único';
        return {
          status: 409,
          body: {
            error: `Já existe um registro cadastrado com o mesmo valor para: ${fields}.`,
            solution: 'Informe um valor diferente para o campo duplicado (como e-mail ou documento) e tente salvar novamente.',
            requestId,
            timestamp,
          },
        };
      }
      case 'P2025':
        return {
          status: 404,
          body: {
            error: 'O registro solicitado não foi encontrado no banco de dados.',
            solution: 'Atualize a página para recarregar os dados mais recentes.',
            requestId,
            timestamp,
          },
        };
      case 'P2003':
        return {
          status: 400,
          body: {
            error: 'Operação não permitida: existem outros registros vinculados a este item.',
            solution: 'Remova os registros dependentes (como familiares ou alertas vinculados) antes de excluir ou alterar.',
            requestId,
            timestamp,
          },
        };
      case 'P2021':
      case 'P2022':
        return {
          status: 503,
          body: {
            error: 'A estrutura do banco de dados está em processo de sincronização.',
            solution: 'Aguarde alguns segundos e tente novamente. Se persistir, contate o administrador do sistema.',
            requestId,
            timestamp,
          },
        };
      default:
        break;
    }
  }

  // 3. Erro de sintaxe JSON ou Payload
  if (err?.type === 'entity.parse.failed' || err?.message?.includes('JSON')) {
    return {
      status: 400,
      body: {
        error: 'Formato de dados inválido enviado na requisição.',
        solution: 'Verifique se os campos do formulário contêm caracteres especiais não suportados e tente novamente.',
        requestId,
        timestamp,
      },
    };
  }

  // 4. Erros de CORS
  if (err?.message?.includes('CORS')) {
    return {
      status: 403,
      body: {
        error: 'Acesso bloqueado pela política de segurança de origem (CORS).',
        solution: 'Certifique-se de acessar o sistema pelo domínio oficial configurado.',
        requestId,
        timestamp,
      },
    };
  }

  // 5. Erros genéricos de servidor
  const rawMsg = String(err?.message || '');
  if (rawMsg.includes('does not exist') || rawMsg.includes('PrismaClient')) {
    return {
      status: 500,
      body: {
        error: 'Instabilidade momentânea de comunicação com a base de dados.',
        solution: 'Aguarde 5 segundos e tente novamente. Se a mensagem persistir, envie o código de rastreamento ao suporte.',
        requestId,
        timestamp,
      },
    };
  }

  return {
    status: err.status || 500,
    body: {
      error: err.message || 'Ocorreu um erro inesperado ao processar sua solicitação.',
      solution: 'Tente novamente em instantes. Se o problema continuar, informe o código de suporte ao administrador.',
      requestId,
      timestamp,
    },
  };
}
