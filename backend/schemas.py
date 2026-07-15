#!/bin/python3
"""Schemas Pydantic para validação de entrada nas rotas de autenticação.

Substitui validação manual com if's por validação declarativa com tipagem.
Equivalente funcional do Yup/Zod no ecossistema Python/Flask (Req 2c.iv)."""

from pydantic import BaseModel, EmailStr, Field, field_validator

class CadastroSchema(BaseModel):
    """Valida payload de /auth/register"""
    nome: str = Field(min_length=1)
    email: EmailStr
    senha: str = Field(min_length=4)

    # Validação extra: confirmação de senha (quando o frontend enviar)
    # Nota: o campo confirmacao_senha é opcional no backend para manter
    # compatibilidade com o frontend atual. A validação cruzada só ocorre
    # quando o campo é enviado.
    confirmacao_senha: str | None = Field(default=None)

    @field_validator("confirmacao_senha")
    @classmethod
    def senhas_conferem(cls, v, info):
        if v is not None:
            senha = info.data.get("senha")
            if senha and v != senha:
                raise ValueError("Senha e confirmação não conferem")
        return v


class LoginSchema(BaseModel):
    """Valida payload de /auth/login"""
    email: EmailStr
    senha: str = Field(min_length=1)