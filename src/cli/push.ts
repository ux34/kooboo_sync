#!/usr/bin/env node
import { pushTask } from '../push';

const force = process.argv.includes('-f') || process.argv.includes('--force');
pushTask(force);