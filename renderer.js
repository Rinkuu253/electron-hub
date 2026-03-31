const findUsbBtn = document.getElementById('find-usb');
const driveList = document.getElementById('drive-list');
const fileList = document.getElementById('file-list');
const currentPathEl = document.getElementById('current-path');

findUsbBtn.addEventListener('click', async () => {
  driveList.innerHTML = 'Searching...';
  try {
    const drives = await window.electronAPI.getUSBDrives();
    alert("Driver Terbaca");
    
    driveList.innerHTML = '';
    if (drives.length === 0) {
      driveList.innerText = 'No USB drives found.';
      return;
    }

    drives.forEach(drive => {
      const btn = document.createElement('button');
      btn.innerText = `${drive.deviceId} ${drive.volumeName || 'USB'}`.trim();
      alert("Driver Terbaca");
      btn.onclick = () => readDirectory(`${drive.deviceId}\\`);
      driveList.appendChild(btn);
    });
  } catch (err) {
    driveList.innerHTML = `<span style="color:red">Error: ${err.message}</span>`;
  }
});

async function readDirectory(path) {
  fileList.innerHTML = 'Reading...';
  currentPathEl.innerText = `Contents of ${path}`;
  
  const items = await window.electronAPI.readDir(path);
  fileList.innerHTML = '';
  
  if (items.length === 0) {
    const li = document.createElement('li');
    li.innerText = '(Empty)';
    fileList.appendChild(li);
    return;
  }

  items.forEach(item => {
    const li = document.createElement('li');
    li.innerText = `${item.isDirectory ? '📁' : '📄'} ${item.name}`;
    li.style.cursor = item.isDirectory ? 'pointer' : 'default';
    li.style.padding = '4px 0';
    
    if (item.isDirectory) {
      li.onclick = () => readDirectory(`${path}${item.name}\\`);
      li.style.textDecoration = 'underline';
      li.style.color = 'blue';
    }
    
    fileList.appendChild(li);
  });
}
