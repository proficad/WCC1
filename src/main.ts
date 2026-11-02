import './style.css';
import { mountEditor } from './controller';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) mountEditor(app);
