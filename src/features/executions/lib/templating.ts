import Handlebars from 'handlebars';

/**
 * Interpolate a string template using Handlebars syntax
 *
 * Example:
 *   interpolate("Hello {{name}}", { name: "World" }) => "Hello World"
 *   interpolate("{{httpResponse.data.userId}}", { httpResponse: { data: { userId: 123 } } }) => "123"
 */
export function interpolate(
  template: string,
  context: Record<string, unknown>
): string {
  if (!template) return template;

  // Check if template contains any Handlebars expressions
  if (!template.includes('{{')) {
    return template;
  }

  try {
    const compiled = Handlebars.compile(template, {
      noEscape: true, // Don't HTML-escape values
    });
    return compiled(context);
  } catch (error) {
    // If template compilation fails, return original string
    console.error('Template interpolation failed:', error);
    return template;
  }
}

/**
 * Interpolate all string values in an object recursively
 */
export function interpolateObject<T extends Record<string, unknown>>(
  obj: T,
  context: Record<string, unknown>
): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = interpolate(value, context);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = interpolateObject(value as Record<string, unknown>, context);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Check if a string contains template expressions
 */
export function hasTemplateExpressions(str: string): boolean {
  return str.includes('{{') && str.includes('}}');
}
