import { Request, Response } from 'express';
import { AutomationService } from '../services/AutomationService';

export class AutomationController {
  static async runToday(req: Request, res: Response) {
    try {
      const report = await AutomationService.scanAndDispatch(new Date(), false);
      return res.json({
        success: true,
        message: 'Varredura de automação executada com sucesso',
        report,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao executar automação' });
    }
  }

  static async simulate(req: Request, res: Response) {
    try {
      const { targetDate } = req.body;
      const dateToSimulate = targetDate ? new Date(targetDate) : new Date();

      if (isNaN(dateToSimulate.getTime())) {
        return res.status(400).json({ error: 'Data de simulação inválida' });
      }

      const report = await AutomationService.scanAndDispatch(dateToSimulate, true);
      return res.json({
        success: true,
        message: `Simulação realizada para ${dateToSimulate.toLocaleDateString('pt-BR')}`,
        report,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao simular automação' });
    }
  }
}
