## What has been done
- send data to the app data folder
- retrieve google drive files

## Concerns
- When app data is uploaded it returns a file id, which we can use to get this file.
    >> Where do we save this id ?
    >> Because we would need this ID to retrieve and restore the wallet data

## In which cases would the user need to restore their wallet data
- When he uninstalls the app, in this case, offline data is lost, so this means the ID can be saved offline
- When he has lost the wallet data, in this case, the backup Id can be gotten from the offline storage.
- So, where should this ID be saved ?

## What are the constraints ?
- When do we backup wallet data ?
- And if this wallet data is backed up once, that means that we just have have to keep on updating the first      file that we uploaded.

## Questions
- 