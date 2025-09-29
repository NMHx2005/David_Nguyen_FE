import { Injectable } from '@angular/core';

/**
 * JSON Serialization Service
 * Handles reading/writing JSON data to localStorage and file operations
 */
@Injectable({
    providedIn: 'root'
})
export class JsonService {

    constructor() { }

    /**
     * Write data to localStorage as JSON
     * @param key Storage key
     * @param data Data to serialize
     * @returns boolean indicating success
     */
    writeToStorage<T>(key: string, data: T): boolean {
        try {
            const jsonString = JSON.stringify(data, this.replacer);
            localStorage.setItem(key, jsonString);
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
            return false;
        }
    }

    /**
     * Read data from localStorage and parse as JSON
     * @param key Storage key
     * @param defaultValue Default value if key doesn't exist
     * @returns Parsed data or default value
     */
    readFromStorage<T>(key: string, defaultValue: T): T {
        try {
            const jsonString = localStorage.getItem(key);
            if (jsonString === null) {
                return defaultValue;
            }
            return JSON.parse(jsonString, this.reviver);
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     * @param key Storage key
     * @returns boolean indicating success
     */
    removeFromStorage(key: string): boolean {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage key "${key}":`, error);
            return false;
        }
    }

    /**
     * Clear all localStorage data
     * @returns boolean indicating success
     */
    clearStorage(): boolean {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Export data to JSON file
     * @param data Data to export
     * @param filename Filename for download
     * @returns boolean indicating success
     */
    exportToFile<T>(data: T, filename: string = 'export.json'): boolean {
        try {
            const jsonString = JSON.stringify(data, this.replacer, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error exporting to file:', error);
            return false;
        }
    }

    /**
     * Import data from JSON file
     * @param file File to import
     * @returns Promise with parsed data
     */
    async importFromFile<T>(file: File): Promise<T | null> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();

                reader.onload = (event) => {
                    try {
                        const jsonString = event.target?.result as string;
                        const data = JSON.parse(jsonString, this.reviver);
                        resolve(data);
                    } catch (parseError) {
                        console.error('Error parsing imported file:', parseError);
                        reject(parseError);
                    }
                };

                reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                    reject(error);
                };

                reader.readAsText(file);
            } catch (error) {
                console.error('Error importing file:', error);
                reject(error);
            }
        });
    }

    /**
     * Serialize data to JSON string with custom replacer
     * @param data Data to serialize
     * @param prettyPrint Whether to format with indentation
     * @returns JSON string
     */
    serialize<T>(data: T, prettyPrint: boolean = false): string {
        try {
            return JSON.stringify(data, this.replacer, prettyPrint ? 2 : undefined);
        } catch (error) {
            console.error('Error serializing data:', error);
            throw error;
        }
    }

    /**
     * Deserialize JSON string to data with custom reviver
     * @param jsonString JSON string to parse
     * @returns Parsed data
     */
    deserialize<T>(jsonString: string): T {
        try {
            return JSON.parse(jsonString, this.reviver);
        } catch (error) {
            console.error('Error deserializing data:', error);
            throw error;
        }
    }

    /**
     * Validate JSON string
     * @param jsonString JSON string to validate
     * @returns boolean indicating validity
     */
    isValidJson(jsonString: string): boolean {
        try {
            JSON.parse(jsonString);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get all localStorage keys
     * @returns Array of storage keys
     */
    getStorageKeys(): string[] {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                keys.push(key);
            }
        }
        return keys;
    }

    /**
     * Get storage usage information
     * @returns Object with storage usage details
     */
    getStorageInfo(): { used: number; available: number; total: number } {
        let used = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                if (value) {
                    used += key.length + value.length;
                }
            }
        }

        // Estimate available space (most browsers have 5-10MB limit)
        const total = 5 * 1024 * 1024; // 5MB estimate
        const available = total - used;

        return { used, available, total };
    }

    /**
     * Custom replacer function for JSON.stringify
     * Handles Date objects and other special types
     */
    private replacer(key: string, value: any): any {
        if (value instanceof Date) {
            return {
                __type: 'Date',
                value: value.toISOString()
            };
        }
        return value;
    }

    /**
     * Custom reviver function for JSON.parse
     * Handles Date objects and other special types
     */
    private reviver(key: string, value: any): any {
        if (value && typeof value === 'object' && value.__type === 'Date') {
            return new Date(value.value);
        }
        return value;
    }

    /**
     * Backup all application data
     * @returns Object containing all stored data
     */
    backupAllData(): { [key: string]: any } {
        const backup: { [key: string]: any } = {};
        const keys = this.getStorageKeys();

        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    backup[key] = JSON.parse(data, this.reviver);
                } catch (error) {
                    console.warn(`Could not parse data for key "${key}":`, error);
                    backup[key] = data; // Store as raw string
                }
            }
        });

        return backup;
    }

    /**
     * Restore data from backup
     * @param backup Backup data object
     * @returns boolean indicating success
     */
    restoreFromBackup(backup: { [key: string]: any }): boolean {
        try {
            // Clear existing data
            this.clearStorage();

            // Restore data
            Object.keys(backup).forEach(key => {
                this.writeToStorage(key, backup[key]);
            });

            return true;
        } catch (error) {
            console.error('Error restoring from backup:', error);
            return false;
        }
    }
}
