import express, { Request, Response, Application } from 'express';

const usuario: Application = express();
const porta: number = 3000;

usuario.get('/usuario/:email', (req: Request, res: Response): void => {
    const { email } = req.params;
    res.send(`O email do usuário é: ${email}`);
});

usuario.listen(porta, (): void => {
    console.log(`Servidor de testes rodando na porta ${porta}`);
});

export function findAll(): never {
    throw new Error('Function not implemented.');
}