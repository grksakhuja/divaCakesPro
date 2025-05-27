/**
 * Feature Flags Configuration
 * 
 * Controls the availability of various features in the application.
 * Set to true to enable, false to disable.
 */

export interface FeatureFlags {
  /** Enable/disable all template-related functionality */
  templates: {
    /** Show template section in the cake builder UI */
    showTemplateSection: boolean;
    /** Enable template API endpoints */
    enableTemplateApi: boolean;
    /** Run template seeding on server start */
    enableTemplateSeeding: boolean;
  };
}

export const featureFlags: FeatureFlags = {
  templates: {
    showTemplateSection: false,
    enableTemplateApi: false,
    enableTemplateSeeding: false,
  },
};

/**
 * Helper function to check if template features are enabled
 */
export function areTemplatesEnabled(): boolean {
  return (
    featureFlags.templates.showTemplateSection ||
    featureFlags.templates.enableTemplateApi ||
    featureFlags.templates.enableTemplateSeeding
  );
}

/**
 * Helper function to check if template API should be available
 */
export function isTemplateApiEnabled(): boolean {
  return featureFlags.templates.enableTemplateApi;
}

/**
 * Helper function to check if template seeding should run
 */
export function isTemplateSeedingEnabled(): boolean {
  return featureFlags.templates.enableTemplateSeeding;
}

/**
 * Helper function to check if template UI should be shown
 */
export function shouldShowTemplateSection(): boolean {
  return featureFlags.templates.showTemplateSection;
} 