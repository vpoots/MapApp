#!C:\mapApp\qradar_appfw_venv\Scripts\python.exe
# EASY-INSTALL-ENTRY-SCRIPT: 'supervisor==3.0a10','console_scripts','supervisord'
__requires__ = 'supervisor==3.0a10'
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.exit(
        load_entry_point('supervisor==3.0a10', 'console_scripts', 'supervisord')()
    )
