// Export all portfolios

export { undeadPortfolio } from './undead';
export { demonPortfolio } from './demon';
export { elementalPortfolio } from './elemental';
export { feyPortfolio } from './fey';

import { undeadPortfolio } from './undead';
import { demonPortfolio } from './demon';
import { elementalPortfolio } from './elemental';
import { feyPortfolio } from './fey';
import { Portfolio, PortfolioType } from '../../types';

export const portfolios: Record<PortfolioType, Portfolio> = {
  undead: undeadPortfolio,
  demon: demonPortfolio,
  elemental: elementalPortfolio,
  fey: feyPortfolio,
};
