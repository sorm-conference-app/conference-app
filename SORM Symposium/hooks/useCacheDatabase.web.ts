/**
 * Web-specific version of useCacheDatabase that returns null since SQLite is not available on web
 * @returns null
 */
function useCacheDatabase() {
  return null;
}

export default useCacheDatabase; 