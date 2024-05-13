import { compileFromFile } from 'json-schema-to-typescript';
import { load as yamlLoad } from 'js-yaml';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';
import globWatcher from 'glob-watcher';
import * as path from 'path';
import * as fs from 'fs';
import { MARKER, interfaceToType } from './utils';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export async function generate() {
  // Compilation of yml files into typecript export for loading in AJV from node
  const schemasFiles = globSync('./templates/src/schemas/*.yml');
  const schemasObjects = schemasFiles.map((file) => {
    const [_, name] = file.match(/\/([^/]+)\.yml$/)!;
    return replaceRefs(yamlLoad(fs.readFileSync(file, 'utf8')));
  });
  const bundledSchemas = schemasObjects.map((object) => {
    return `export const ${object.$id} = ${JSON.stringify(object, null, 2)};`;
  });
  fs.writeFileSync(
    './templates/src/schemas/index.ts',
    MARKER + '\n\n' + bundledSchemas.join('\n'),
    'utf8',
  );

  // Actual compilatino of typescript types

  const schemaTypings = await compileFromFile('./templates/src/schemas/config.yml', {
    bannerComment: '',
  });
  fs.writeFileSync('./templates/src/config.d.ts', `${MARKER}\n\n${interfaceToType(schemaTypings)}`);

  console.log('Config types regenerated');
}

export function watch() {
  generate();
  globWatcher(['./templates/src/schemas/*.yml'], generate);
}

function replaceRefs(schemaObject: any) {
  for (const [key, value] of Object.entries(schemaObject)) {
    if (key === '$ref') {
      const [_, name] = (value as string).match(/\/([^/]+)\.yml$/)!;
      schemaObject.$ref = toCamelCase(name) + 'Config';
    } else if (typeof value === 'object' && value !== null) {
      replaceRefs(value);
    } else if (Array.isArray(value)) {
      value.forEach(replaceRefs);
    }
  }
  return schemaObject;
}

function toCamelCase(str: string) {
  return str.replace(/-./g, (x) => x[1].toUpperCase()).replace(/^./, (x) => x.toUpperCase());
}