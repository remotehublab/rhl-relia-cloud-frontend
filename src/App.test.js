import fs from 'fs';
import path from 'path';

import { RELIA_DIST_ELEMENTS_MARKER } from './conversations/reliaConversation';

describe('RELIA AI widget packaging', () => {
    test('loads the dist-elements bundle only', () => {
        const indexPath = path.join(__dirname, '..', 'public', 'index.html');
        const html = fs.readFileSync(indexPath, 'utf8');

        expect(html).toContain(RELIA_DIST_ELEMENTS_MARKER);
        expect(html).not.toContain('/ai/ll-widgets-ng-elements/');
        expect(html).not.toContain('/ai/ll-widgets-ng/');
    });
});
