import { TrashCan } from '@carbon/icons-react';
import { Button } from '@mui/joy';
import { STORAGE_KEY_PREFIX } from '../model/JSONStorage';

export const DiscardChangesButton = () => (
  <Button
    startDecorator={<TrashCan />}
    onClick={() => {
      if (confirm('Discard all of your theme customisations?')) {
        const keys = Array(localStorage.length)
          .fill(null)
          .map((_, i) => localStorage.key(i));
        for (const key of keys) {
          if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
            localStorage.removeItem(key);
          }
        }
        location.reload();
      }
    }}
  >
    Discard changes
  </Button>
);
