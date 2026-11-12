/** Only allow redirects to paths inside this site (prevents open-redirect attacks). */
export function safeNext(value: string | null | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value;
  }
  return "/dashboard";
}
