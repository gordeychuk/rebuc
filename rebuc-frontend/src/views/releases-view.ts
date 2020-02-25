import BitbucketCompareIcon from '@atlaskit/icon/glyph/bitbucket/compare';
import BitbucketBuildsIcon from '@atlaskit/icon/glyph/bitbucket/builds';
import CodeIcon from '@atlaskit/icon/glyph/code';
import { LinkItem } from '../components/elements/link-item';
import { MenuHeaderItem } from '../components/elements/menu-header';

export const releasesView = {
    getItems: () => [
        {
            id: 'product/home:header',
            items: [
                {
                    component: MenuHeaderItem,
                    id: 'rebuc',
                    style: { padding: 120 },
                    text: 'Rebuc',
                    type: 'InlineComponent',
                },
            ],
            type: 'HeaderSection',
        },
        {
            id: 'product/home:menu',
            items: [
                {
                    before: BitbucketCompareIcon,
                    component: LinkItem,
                    id: 'releases',
                    text: 'Releases',
                    to: '/',
                    type: 'InlineComponent',
                },
                {
                    before: BitbucketBuildsIcon,
                    component: LinkItem,
                    id: 'builds',
                    text: 'Builds',
                    to: '/builds',
                    type: 'InlineComponent',
                },
                {
                    before: CodeIcon,
                    component: LinkItem,
                    id: 'api',
                    text: 'REST API',
                    to: '/restapi',
                    type: 'InlineComponent',
                },
            ],
            parentId: null,
            type: 'MenuSection',
        },
    ],
    id: 'product/home',
    type: 'product',
};
