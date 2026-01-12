// Data recovery utilities

export const checkLocalStorage = () => {
  try {
    const data = localStorage.getItem('circusAppData');
    if (data) {
      const parsed = JSON.parse(data);
      return {
        exists: true,
        data: parsed,
        hasCoaches: parsed.coaches && parsed.coaches.length > 0,
        hasLessons: parsed.lessons && parsed.lessons.length > 0,
        hasStudents: parsed.students && parsed.students.length > 0,
      };
    }
    return { exists: false };
  } catch (e) {
    console.error('Error checking localStorage:', e);
    return { exists: false, error: e.message };
  }
};

export const backupData = () => {
  try {
    const data = localStorage.getItem('circusAppData');
    if (data) {
      const backupKey = `circusAppData_backup_${Date.now()}`;
      localStorage.setItem(backupKey, data);
      return backupKey;
    }
    return null;
  } catch (e) {
    console.error('Error backing up data:', e);
    return null;
  }
};

export const restoreFromBackup = (backupKey) => {
  try {
    const backup = localStorage.getItem(backupKey);
    if (backup) {
      localStorage.setItem('circusAppData', backup);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error restoring from backup:', e);
    return false;
  }
};

export const getAllBackups = () => {
  const backups = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('circusAppData_backup_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        backups.push({
          key,
          timestamp: parseInt(key.split('_').pop()),
          hasCoaches: data.coaches && data.coaches.length > 0,
          hasLessons: data.lessons && data.lessons.length > 0,
          hasStudents: data.students && data.students.length > 0,
        });
      } catch (e) {
        // Skip invalid backups
      }
    }
  }
  return backups.sort((a, b) => b.timestamp - a.timestamp);
};
