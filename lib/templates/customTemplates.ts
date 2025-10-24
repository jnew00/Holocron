/**
 * Custom template management - save, load, delete user-created templates
 */

import { encrypt, decrypt } from "@/lib/crypto/aesgcm";
import { NoteTemplate } from "./templates";

const CUSTOM_TEMPLATES_FILE = "config/custom-templates.json.enc";

/**
 * Load custom templates from encrypted file
 */
export async function loadCustomTemplates(
  dirHandle: FileSystemDirectoryHandle,
  passphrase: string
): Promise<NoteTemplate[]> {
  try {
    const configDir = await dirHandle.getDirectoryHandle("config");
    const fileHandle = await configDir.getFileHandle("custom-templates.json.enc");
    const file = await fileHandle.getFile();
    const encryptedContent = await file.text();
    const decryptedContent = await decrypt(encryptedContent, passphrase);
    return JSON.parse(decryptedContent);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Save custom templates to encrypted file
 */
export async function saveCustomTemplates(
  dirHandle: FileSystemDirectoryHandle,
  templates: NoteTemplate[],
  passphrase: string
): Promise<void> {
  const configDir = await dirHandle.getDirectoryHandle("config", { create: true });
  const encryptedContent = await encrypt(JSON.stringify(templates, null, 2), passphrase);

  const fileHandle = await configDir.getFileHandle("custom-templates.json.enc", {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(encryptedContent);
  await writable.close();
}

/**
 * Add a new custom template
 */
export async function addCustomTemplate(
  dirHandle: FileSystemDirectoryHandle,
  template: NoteTemplate,
  passphrase: string
): Promise<void> {
  const templates = await loadCustomTemplates(dirHandle, passphrase);
  templates.push(template);
  await saveCustomTemplates(dirHandle, templates, passphrase);
}

/**
 * Update an existing custom template
 */
export async function updateCustomTemplate(
  dirHandle: FileSystemDirectoryHandle,
  templateId: string,
  updatedTemplate: NoteTemplate,
  passphrase: string
): Promise<void> {
  const templates = await loadCustomTemplates(dirHandle, passphrase);
  const index = templates.findIndex((t) => t.id === templateId);
  if (index !== -1) {
    templates[index] = updatedTemplate;
    await saveCustomTemplates(dirHandle, templates, passphrase);
  }
}

/**
 * Delete a custom template
 */
export async function deleteCustomTemplate(
  dirHandle: FileSystemDirectoryHandle,
  templateId: string,
  passphrase: string
): Promise<void> {
  const templates = await loadCustomTemplates(dirHandle, passphrase);
  const filtered = templates.filter((t) => t.id !== templateId);
  await saveCustomTemplates(dirHandle, filtered, passphrase);
}
