/* Retail and wholesale are two storefronts behind one login.
 *
 * The plan decides which a seller may operate: the retail tier is retail only,
 * the wholesale tier is both — which is what the pricing page has always said
 * ("Wholesale sellers have access to our retail tab for free"). Everything
 * downstream — dashboard figures, the product list, which fields the product
 * form shows — reads the mode from here.
 */

export type StorefrontMode = 'RETAIL' | 'WHOLESALE';

export const MODE_LABEL: Record<StorefrontMode, string> = {
  RETAIL: 'Retail',
  WHOLESALE: 'Wholesale'
};

/**
 * Plan code → the storefronts it unlocks.
 *
 * The backend still seeds these as BASIC and STANDARD; RETAIL and WHOLESALE
 * are listed too so renaming the catalogue needs no change on this side.
 */
const PLAN_MODES: Record<string, StorefrontMode[]> = {
  BASIC: ['RETAIL'],
  RETAIL: ['RETAIL'],
  STANDARD: ['RETAIL', 'WHOLESALE'],
  WHOLESALE: ['RETAIL', 'WHOLESALE']
};

/**
 * What this plan can sell through. An unknown or absent plan gets retail only
 * — the lesser capability, so a billing hiccup can never hand someone a
 * storefront they are not paying for.
 */
export const modesForPlan = (
  planCode: string | null | undefined
): StorefrontMode[] =>
  (planCode && PLAN_MODES[planCode.toUpperCase()]) || ['RETAIL'];

export const isModeAllowed = (
  mode: StorefrontMode,
  planCode: string | null | undefined
): boolean => modesForPlan(planCode).includes(mode);

/** Where the chosen storefront is remembered between visits. */
export const STOREFRONT_STORAGE_KEY = 'tredella.storefront';

export const readStoredMode = (): StorefrontMode | null => {
  try {
    const stored = window.localStorage.getItem(STOREFRONT_STORAGE_KEY);
    return stored === 'RETAIL' || stored === 'WHOLESALE' ? stored : null;
  } catch {
    // private browsing, blocked storage — the default is fine
    return null;
  }
};

export const storeMode = (mode: StorefrontMode): void => {
  try {
    window.localStorage.setItem(STOREFRONT_STORAGE_KEY, mode);
  } catch {
    // nothing to do; the choice just will not survive a reload
  }
};
