export async function processMessage(message: string): Promise<string> {
  // Pour l'instant, l'agent répond simplement
  // Cette fonction sera étendue avec la logique IA plus tard
  return `Ok I received your message: "${message}"`;
}
