/**
 * Wraps a promise with a timeout. If the promise does not resolve within
 * `ms` milliseconds, it rejects with a user-friendly error message.
 *
 * Use this around Supabase calls inside mutation functions to prevent
 * buttons from staying stuck in "Salvando..." / "Criando..." state
 * when there is a network issue or the Supabase project is cold-starting.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms = 15000,
  message = "A operação demorou muito. Verifique sua conexão e tente novamente."
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
  return Promise.race([promise, timeout]);
}
