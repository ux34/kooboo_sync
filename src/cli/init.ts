#!/usr/bin/env node
import { initTask } from '../init';

const url = process.argv[3];
initTask(url);