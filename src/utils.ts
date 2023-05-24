export function trackProgress<T>(
  promises: Promise<T>[],
  callback: (progress: number) => void
) {
  let completedCount = 0
  const totalCount = promises.length

  return new Promise((resolve, reject) => {
    promises.forEach(promise => {
      promise
        .then(result => {
          completedCount++

          const progress = Math.round((completedCount / totalCount) * 100)
          callback(progress)

          if (completedCount === totalCount) {
            resolve(result) // Todas as promessas foram resolvidas
          }
        })
        .catch(error => {
          reject(error) // Uma promessa foi rejeitada
        })
    })
  })
}