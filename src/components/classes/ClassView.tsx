import * as React from 'react';
import type { Hero } from '@/types/hero';
import type { BaseClassViewProps } from './types';

// Import all class views
import { CensorView } from './censor/CensorView';
import { ConduitView } from './conduit/ConduitView';
import { ElementalistView } from './elementalist/ElementalistView';
import { FuryView } from './fury/FuryView';
import { NullView } from './null/NullView';
import { ShadowView } from './shadow/ShadowView';
import { TacticianView } from './tactician/TacticianView';
import { TalentView } from './talent/TalentView';
import { TroubadourView } from './troubadour/TroubadourView';
import { SummonerView } from './summoner/SummonerView';

interface ClassViewProps extends BaseClassViewProps {
  // All class-specific props are handled internally by each view
}

export const ClassView: React.FC<ClassViewProps> = (props) => {
  const { hero } = props;

  switch (hero.heroClass) {
    case 'censor':
      return <CensorView {...props} />;

    case 'conduit':
      return <ConduitView {...props} />;

    case 'elementalist':
      return <ElementalistView {...props} />;

    case 'fury':
      return <FuryView {...props} />;

    case 'null':
      return <NullView {...props} />;

    case 'shadow':
      return <ShadowView {...props} />;

    case 'tactician':
      return <TacticianView {...props} />;

    case 'talent':
      return <TalentView {...props} />;

    case 'troubadour':
      return <TroubadourView {...props} />;

    case 'summoner':
      return <SummonerView {...props} />;

    default:
      return (
        <div className="class-view class-view-unknown">
          <p>Unknown class: {(hero as Hero).heroClass}</p>
        </div>
      );
  }
};

export default ClassView;
