#!/usr/bin/env node

/**
 * CLI Entry Point - delegates to modularized CLI
 */
import { setupCLI } from './cli/index';

const program = setupCLI();
program.parse();