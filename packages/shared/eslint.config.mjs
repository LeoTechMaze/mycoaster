import { ignores, metrics, nodeTypeChecked } from '../../eslint.base.mjs';

export default [ignores, ...nodeTypeChecked(import.meta.dirname), metrics({ complexity: 15 })];
