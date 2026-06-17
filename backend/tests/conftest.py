"""Point the database at a throwaway file before the app imports config."""

import os
import tempfile

os.environ["PRELEGAL_DB_PATH"] = os.path.join(tempfile.mkdtemp(), "test.db")
