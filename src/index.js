#!/usr/bin/env node
import 'dotenv/config'
import { Command } from 'commander'
import {decryptFile, encryptFile} from "./encrypt.js";
import {readFile, writeFile} from "fs/promises";
import { basename } from 'path';
import {upload, download} from "./s3.js";


const program = new Command()
program
    .name('dumpsafe')
    .description('Safely manage shared data dumps with simplicity')
    .version('0.1.0');

program
    .command('encrypt')
    .description('Encrypt a dump')
    .argument('<filepath>', 'The path to the file')
    .action(async (filepath) => {
        const data = await readFile(filepath)
        const fileBuffer = encryptFile(data)
        const filename = basename(filepath)

        await writeFile(`${filename}.enc`, fileBuffer)
        console.log(`Successfully encrypted ${filename} as ${filename}.enc`)
    })

program
    .command('decrypt')
    .description('Decrypt a dump')
    .argument('<filepath>', 'The path to the file')
    .action(async (filepath) => {
        const toFile = filepath.replace('.enc', '');

        const data = await readFile(filepath)
        const fileBuffer = decryptFile(data)

        const filename = basename(filepath)

        await writeFile(`${toFile}`, fileBuffer)
        console.log(`Successfully decrypted ${filename} as ${toFile}`)
    })

program
    .command('upload')
    .description('Upload a dump to store')
    .argument('<filepath>', 'The path to the file')
    .action(async (filepath) => {
        const data = await readFile(filepath);
        const encryptedFile = encryptFile(data)

        const filename = basename(filepath)

        await upload(filename, encryptedFile)

        console.log(`Successfully uploaded ${filename}`)
    })

program
    .command('download')
    .description('Download a dump from the store')
    .argument('<filename>', 'The name of the file to download')
    .argument('[location]', 'The location to download the file to', './')
    .action(async (filename, location) => {
        const data = await download(filename)
        const fileBuffer = decryptFile(data)

        await writeFile(`${location}/${filename}`, fileBuffer)

        console.log(`Successfully downloaded ${filename} to ${location}`)
    })

program
    .command('delete')
    .description('Remove a dump from the store')
    .argument('<filename>', 'The name of the file to delete')
    .action((filename) => {
        console.warn('Not Yet Implemented')
    })

await program.parseAsync()
