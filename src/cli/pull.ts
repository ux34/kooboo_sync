#!/usr/bin/env node
import { pullTask } from '../pull';

const force = process.argv.includes('-f') || process.argv.includes('--force');
pullTask(force);