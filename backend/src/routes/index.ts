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
import { authMiddleware } from '../middlewares/authMiddleware';

const routes = Router();

// ==========================================
// Rotas Públicas
// ==========================================
routes.post('/auth/login', AuthController.login);

// ==========================================
// Rotas Protegidas (JWT)
// ==========================================
routes.use(authMiddleware as any);

// Usuário Conectado
routes.get('/auth/me', AuthController.me as any);

// Gestão de Usuários do Sistema
routes.get('/users', UserController.list);
routes.get('/users/:id', UserController.getById);
routes.post('/users', UserController.create);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.delete);

// Alertas & Dashboard Stats
routes.get('/alerts/stats', AlertController.getStats);
routes.get('/alerts', AlertController.list);
routes.patch('/alerts/:id/toggle-sent', AlertController.toggleSent);
routes.post('/alerts/resend-notification', AlertController.resendNotification);

// Clientes
routes.get('/clients/stats', ClientController.getStats);
routes.get('/clients', ClientController.list);
routes.get('/clients/:id', ClientController.getById);
routes.post('/clients', ClientController.create);
routes.put('/clients/:id', ClientController.update);
routes.delete('/clients/:id', ClientController.delete);
routes.patch('/clients/:id/lgpd', ClientController.toggleLgpd);

// Familiares
routes.post('/family-members', FamilyMemberController.create);
routes.put('/family-members/:id', FamilyMemberController.update);
routes.delete('/family-members/:id', FamilyMemberController.delete);
routes.get('/family-members/client/:clientId', FamilyMemberController.listByClient);

// Datas Comemorativas & Agenda
routes.get('/commemorative-dates/upcoming', CommemorativeDateController.getUpcoming);
routes.get('/commemorative-dates', CommemorativeDateController.list);
routes.post('/commemorative-dates', CommemorativeDateController.create);
routes.put('/commemorative-dates/:id', CommemorativeDateController.update);
routes.delete('/commemorative-dates/:id', CommemorativeDateController.delete);

// Templates de Mensagem
routes.get('/templates/variables', TemplateController.getVariables);
routes.get('/templates', TemplateController.list);
routes.get('/templates/:id', TemplateController.getById);
routes.post('/templates', TemplateController.create);
routes.put('/templates/:id', TemplateController.update);
routes.delete('/templates/:id', TemplateController.delete);
routes.post('/templates/:id/preview', TemplateController.preview);
routes.post('/templates/preview-custom', TemplateController.previewCustom);

// Motor de Automação
routes.post('/automation/run-today', AutomationController.runToday);
routes.post('/automation/simulate', AutomationController.simulate);

// Configurações
routes.get('/settings', SettingsController.get);
routes.put('/settings', SettingsController.update);
routes.post('/settings/test-callmebot', SettingsController.testCallMeBot);

export default routes;
