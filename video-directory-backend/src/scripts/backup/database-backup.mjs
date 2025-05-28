#!/usr/bin/env node

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const config = {
  mongoUri: process.env.DATABASE_URI || 'mongodb://127.0.0.1/video-directory-backend',
  backupDir: path.join(process.cwd(), 'backups'),
  retentionDays: 30,
  compress: true,
}

// Extract database name from URI
function getDatabaseName(uri: string): string {
  const match = uri.match(/\/([^/?]+)(\?|$)/)
  return match ? match[1] : 'video-directory-backend'
}

// Create backup directory if it doesn't exist
async function ensureBackupDir() {
  try {
    await fs.access(config.backupDir)
  } catch {
    await fs.mkdir(config.backupDir, { recursive: true })
    console.log('✅ Created backup directory:', config.backupDir)
  }
}

// Create database backup
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const dbName = getDatabaseName(config.mongoUri)
  const backupName = `${dbName}-${timestamp}`
  const backupPath = path.join(config.backupDir, backupName)
  
  console.log('🚀 Starting database backup...')
  console.log('Database:', dbName)
  console.log('Backup path:', backupPath)
  
  try {
    // Create mongodump command
    const mongodumpCmd = `mongodump --uri="${config.mongoUri}" --out="${backupPath}"`
    
    console.log('⏳ Executing mongodump...')
    const { stdout, stderr } = await execAsync(mongodumpCmd)
    
    if (stderr && !stderr.includes('writing')) {
      console.warn('⚠️  Mongodump warnings:', stderr)
    }
    
    console.log('✅ Database backup completed')
    
    // Compress backup if enabled
    if (config.compress) {
      console.log('⏳ Compressing backup...')
      const tarCmd = `tar -czf "${backupPath}.tar.gz" -C "${config.backupDir}" "${backupName}"`
      await execAsync(tarCmd)
      
      // Remove uncompressed directory
      await fs.rm(backupPath, { recursive: true, force: true })
      console.log('✅ Backup compressed:', `${backupName}.tar.gz`)
      
      return `${backupPath}.tar.gz`
    }
    
    return backupPath
    
  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  }
}

// Clean old backups
async function cleanOldBackups() {
  console.log('🧹 Cleaning old backups...')
  
  try {
    const files = await fs.readdir(config.backupDir)
    const backupFiles = files.filter(file => 
      file.startsWith(getDatabaseName(config.mongoUri)) && 
      (file.endsWith('.tar.gz') || !file.includes('.'))
    )
    
    const now = Date.now()
    const retentionMs = config.retentionDays * 24 * 60 * 60 * 1000
    
    let deletedCount = 0
    
    for (const file of backupFiles) {
      const filePath = path.join(config.backupDir, file)
      const stats = await fs.stat(filePath)
      const age = now - stats.mtime.getTime()
      
      if (age > retentionMs) {
        await fs.rm(filePath, { recursive: true, force: true })
        deletedCount++
        console.log('🗑️  Deleted old backup:', file)
      }
    }
    
    console.log(`✅ Cleanup completed. Deleted ${deletedCount} old backup(s)`)
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

// Backup statistics
async function getBackupStats() {
  try {
    const files = await fs.readdir(config.backupDir)
    const backupFiles = files.filter(file => 
      file.startsWith(getDatabaseName(config.mongoUri))
    )
    
    let totalSize = 0
    const fileStats = []
    
    for (const file of backupFiles) {
      const filePath = path.join(config.backupDir, file)
      const stats = await fs.stat(filePath)
      totalSize += stats.size
      fileStats.push({
        name: file,
        size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        created: stats.mtime.toISOString().slice(0, 19).replace('T', ' ')
      })
    }
    
    return {
      totalBackups: backupFiles.length,
      totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
      files: fileStats.sort((a, b) => b.created.localeCompare(a.created))
    }
  } catch (error) {
    console.error('❌ Failed to get backup stats:', error)
    return null
  }
}

// Main backup function
async function main() {
  console.log('🔄 Video Directory Database Backup Started')
  console.log('Time:', new Date().toISOString())
  console.log('='.repeat(50))
  
  try {
    await ensureBackupDir()
    
    // Show current stats before backup
    const beforeStats = await getBackupStats()
    if (beforeStats) {
      console.log('📊 Current backup status:')
      console.log(`   Total backups: ${beforeStats.totalBackups}`)
      console.log(`   Total size: ${beforeStats.totalSize}`)
    }
    
    // Create new backup
    const backupPath = await createBackup()
    
    // Clean old backups
    await cleanOldBackups()
    
    // Show final stats
    const afterStats = await getBackupStats()
    if (afterStats) {
      console.log('\n📊 Final backup status:')
      console.log(`   Total backups: ${afterStats.totalBackups}`)
      console.log(`   Total size: ${afterStats.totalSize}`)
      console.log(`   Latest backup: ${path.basename(backupPath)}`)
    }
    
    console.log('\n✅ Backup process completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Backup process failed:', error)
    process.exit(1)
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
if (args.includes('--stats') || args.includes('-s')) {
  // Show backup statistics only
  getBackupStats().then(stats => {
    if (stats) {
      console.log('📊 Backup Statistics:')
      console.log(`Total backups: ${stats.totalBackups}`)
      console.log(`Total size: ${stats.totalSize}`)
      console.log('\nRecent backups:')
      stats.files.slice(0, 10).forEach(file => {
        console.log(`  ${file.name} (${file.size}) - ${file.created}`)
      })
    }
  })
} else {
  // Run full backup
  main()
}

export { createBackup, cleanOldBackups, getBackupStats }
