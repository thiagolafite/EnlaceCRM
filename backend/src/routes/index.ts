import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { ClientController } from '../controllers/ClientController';
import { FamilyMemberController } from '../controllers/FamilyMemberController';
import { CommemorativeDateController } from '../controllers/CommemorativeDateController';
import { TemplateController } from '../controllers/TemplateController';
import { AlertController } from '../controllers/AlertController';
import { AutomationController } from '../controllers/AutomationController';
import { SettingsController } from '../controllers/SettingsController';
import { LogController } from '../controllers/LogController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

const routes = Router();

// ==========================================
// 1. Rotas Públicas de Autenticação
// ==========================================
routes.post('/auth/login', AuthController.login);
routes.post('/auth/register', AuthController.register);

// ==========================================
// 2. Proteção JWT Global para todas as rotas seguintes
// ==========================================
routes.use(authMiddleware as any);

// Perfil do Usuário Conectado
routes.get('/auth/me', AuthController.me as any);

// ==========================================
// 3. Monitoramento e Auditoria de Segurança (Exclusivo MASTER)
// ==========================================
routes.get('/logs/metrics', requireRole('MASTER'), LogController.getMetrics as any);
routes.get('/logs', requireRole('MASTER'), LogController.list as any);
routes.post('/logs/test', requireRole('MASTER'), LogController.testLog as any);
routes.delete('/logs', requireRole('MASTER'), LogController.clear as any);

// ==========================================
// 4. Gestão de Usuários (ADMIN e MASTER)
// ==========================================
routes.get('/users', requireRole('ADMIN', 'MASTER'), UserController.list as any);
routes.get('/users/:id', requireRole('ADMIN', 'MASTER'), UserController.getById as any);
routes.post('/users', requireRole('ADMIN', 'MASTER'), UserController.create as any);
routes.put('/users/:id', requireRole('ADMIN', 'MASTER'), UserController.update as any);
routes.patch('/users/:id/approval', requireRole('MASTER'), UserController.toggleApproval as any);
routes.delete('/users/:id', requireRole('ADMIN', 'MASTER'), UserController.delete as any);

// ==========================================
// 5. Alertas & Dashboard Stats (OPERATOR, ADMIN, MASTER)
// ==========================================
routes.get('/alerts/stats', AlertController.getStats as any);
routes.get('/alerts', AlertController.list as any);
routes.patch('/alerts/:id/toggle-sent', AlertController.toggleSent as any);
routes.post('/alerts/resend-notification', requireRole('ADMIN', 'MASTER'), AlertController.resendNotification as any);

// ==========================================
// 6. Gestão de Clientes (OPERATOR, ADMIN, MASTER)
// ==========================================
routes.get('/clients/stats', ClientController.getStats as any);
routes.get('/clients', ClientController.list as any);
routes.get('/clients/:id', ClientController.getById as any);
routes.post('/clients', ClientController.create as any);
routes.put('/clients/:id', ClientController.update as any);
routes.delete('/clients/:id', ClientController.delete as any);
routes.patch('/clients/:id/lgpd', ClientController.toggleLgpd as any);

// ==========================================
// 7. Familiares do Cliente (OPERATOR, ADMIN, MASTER)
// ==========================================
routes.post('/family-members', FamilyMemberController.create as any);
routes.put('/family-members/:id', FamilyMemberController.update as any);
routes.delete('/family-members/:id', FamilyMemberController.delete as any);
routes.get('/family-members/client/:clientId', FamilyMemberController.listByClient as any);

// ==========================================
// 8. Datas Comemorativas & Agenda
// Leitura: Todos; Criação/Edição/Exclusão: ADMIN e MASTER
// ==========================================
routes.get('/commemorative-dates/upcoming', CommemorativeDateController.getUpcoming as any);
routes.get('/commemorative-dates', CommemorativeDateController.list as any);
routes.post('/commemorative-dates', requireRole('ADMIN', 'MASTER'), CommemorativeDateController.create as any);
routes.put('/commemorative-dates/:id', requireRole('ADMIN', 'MASTER'), CommemorativeDateController.update as any);
routes.delete('/commemorative-dates/:id', requireRole('ADMIN', 'MASTER'), CommemorativeDateController.delete as any);

// ==========================================
// 9. Templates de Mensagem
// Leitura/Preview: Todos; Criação/Edição/Exclusão: ADMIN e MASTER
// ==========================================
routes.get('/templates/variables', TemplateController.getVariables as any);
routes.get('/templates', TemplateController.list as any);
routes.get('/templates/:id', TemplateController.getById as any);
routes.post('/templates', requireRole('ADMIN', 'MASTER'), TemplateController.create as any);
routes.put('/templates/:id', requireRole('ADMIN', 'MASTER'), TemplateController.update as any);
routes.delete('/templates/:id', requireRole('ADMIN', 'MASTER'), TemplateController.delete as any);
routes.post('/templates/:id/preview', TemplateController.preview as any);
routes.post('/templates/preview-custom', TemplateController.previewCustom as any);

// ==========================================
// 10. Motor de Automação (ADMIN e MASTER)
// ==========================================
routes.post('/automation/run-today', requireRole('ADMIN', 'MASTER'), AutomationController.runToday as any);
routes.post('/automation/simulate', requireRole('ADMIN', 'MASTER'), AutomationController.simulate as any);

// ==========================================
// 11. Configurações da Empresa
// Leitura: Todos; Edição/Teste: ADMIN e MASTER
// ==========================================
routes.get('/settings', SettingsController.get as any);
routes.put('/settings', requireRole('ADMIN', 'MASTER'), SettingsController.update as any);
routes.post('/settings/test-callmebot', requireRole('ADMIN', 'MASTER'), SettingsController.testCallMeBot as any);

export default routes;
