// config/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NeuroSync API',
            version: '1.0.0',
            description: 'API para gerenciamento de pacientes neurodivergentes',
            contact: {
                name: 'Suporte NeuroSync',
                email: 'suporte@neurosync.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de Desenvolvimento'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Usuario: {
                    type: 'object',
                    properties: {
                        nome: { type: 'string' },
                        email: { type: 'string' },
                        tipo_usuario: { 
                            type: 'string',
                            enum: ['Paciente', 'Cuidador', 'Terapeuta', 'Medico']
                        },
                        localizacao: {
                            type: 'object',
                            properties: {
                                type: { type: 'string', enum: ['Point'] },
                                coordinates: { type: 'array', items: { type: 'number' } }
                            }
                        }
                    }
                },
                Paciente: {
                    type: 'object',
                    properties: {
                        usuarioId: { type: 'string' },
                        tipo_neurodivergencia: { type: 'string' },
                        cuidado_especial: { type: 'string' }
                    }
                },
                BotaoSos: {
                    type: 'number',
                    properties: {
                        latitude: { type: 'number' },
                        longitude: { type: 'number' },
                        pacienteId: { type: 'string' }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/router/*.ts', './src/controller/*.ts']
};

export const swaggerSpec = swaggerJSDoc(options);