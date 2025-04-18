#!/usr/bin/env node
import { sitePullTask } from '../site-pull';

const modules = process.argv[3];
sitePullTask(modules);