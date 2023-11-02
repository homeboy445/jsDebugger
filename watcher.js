const fs = require('fs');
const { exec } = require('child_process');

// Get the folder path from command line arguments (argv)
const folderToWatch = process.argv[2];

if (!folderToWatch) {
  console.error('Please provide the folder path as a command line argument.');
  process.exit(1);
}

class FileWatcher {
  constructor(folderPath, commandToRun) {
    this.folderPath = folderPath;
    this.isCommandRunnerLocked = false;
    this.commandToRun = commandToRun;
    this.listenerAttached = {};
  }

  listFiles(folderPath) {
    return fs.readdirSync(folderPath);
  }

  attachListener(filePath) {
    if (this.listenerAttached[filePath]) {
      return;
    }
    this.listenerAttached[filePath] = true;
    fs.watch(filePath, (eventType, filename) => {
      if (eventType === 'change') {
        if (this.isCommandRunnerLocked) {
          // console.log("skipping duplicate commands!");
          return;
        }
        this.isCommandRunnerLocked = true;
        console.log(`\nFile '${filename}' has changed. Running 'npm start' command...`);
        // Run the 'npm start' command programmatically
        exec(this.commandToRun, { cwd: this.folderPath }, (error, stdout, stderr) => {
          // setTimeout(() => {
            this.isCommandRunnerLocked = false;
          // }, 2000);
          if (error) {
            console.error(`\nError running 'npm start' command: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`\n'npm start' command had errors: ${stderr}`);
            return;
          }  
          console.log(`\n'npm start' command output:\n${stdout}`);
        });
      }
    });
  }

  isDirectory(path) {
    return fs.statSync(path).isDirectory();
  }

  listen(path = this.folderPath) {
    if (path == this.folderPath) {
      console.log("Watching for any changes in any of the files in this directory: ", this.folderPath);
    }
    if (this.isDirectory(path)) {
      this.listFiles(path).forEach((subPath) => {
        this.listen(`${path}/${subPath}`);
      });
    } else {
      this.attachListener(path);
    }
  }
}

const watcher = new FileWatcher(folderToWatch, "npm start");
watcher.listen();
