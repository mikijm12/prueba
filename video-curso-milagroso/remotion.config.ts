import {Config} from '@remotion/cli/config';

// WebGL por software para poder renderizar en servidores sin GPU
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(2);
