/// Map common Solidity / viem revert reasons into friendly Spanish messages.
const PATTERNS: Array<{ match: RegExp; label: string }> = [
  { match: /User rejected/i, label: "Cancelaste la transacción en la wallet" },
  { match: /insufficient funds/i, label: "Saldo insuficiente para pagar el gas" },
  { match: /RecipientNotVerified/, label: "El destinatario no tiene KYC verificado" },
  { match: /LockupActive/, label: "El token todavía está en lockup" },
  { match: /OrderNotActive/, label: "La orden ya no está activa" },
  { match: /CannotFillOwnOrder/, label: "No puedes ejecutar tu propia orden" },
  { match: /NotOrderMaker/, label: "Sólo el maker puede cancelar esta orden" },
  { match: /ERC20InsufficientBalance/, label: "Saldo insuficiente del token" },
  { match: /ERC20InsufficientAllowance/, label: "Aprobación insuficiente — vuelve a aprobar el token" },
  { match: /InvalidAmount/, label: "Cantidad inválida" },
  { match: /InvalidPrice/, label: "Precio inválido" },
  { match: /AlreadyVerified/, label: "Esta wallet ya está verificada" },
  { match: /NotClaimIssuer/, label: "Sólo el issuer puede ejecutar esta acción" },
];

export function parseViemError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  for (const { match, label } of PATTERNS) {
    if (match.test(raw)) return label;
  }
  // Fall back to the first line of the message, capped to 160 chars.
  return raw.split("\n")[0].slice(0, 160);
}
