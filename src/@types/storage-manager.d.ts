interface FileSystemDirectoryHandle extends FileSystemDirectoryHandle {
  readonly kind: 'directory'
  keys(): AsyncIterableIterator<string>
  values(): AsyncIterableIterator<
    FileSystemDirectoryHandle | FileSystemFileHandle
  >
  entries(): AsyncIterableIterator<
    [string, FileSystemDirectoryHandle | FileSystemFileHandle]
  >
  [Symbol.asyncIterator]: FileSystemDirectoryHandle['entries']
}
