#!/usr/bin/env node
import { sitePushTask } from '../site-push';

const modules = process.argv[3];
sitePushTask(modules);