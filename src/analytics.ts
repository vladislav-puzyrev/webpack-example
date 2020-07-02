import jquery from 'jquery'

function createAnalytics () {
  let counter = 0
  let isDestroyed = false

  const listener = (): number => counter++
  jquery(document).on('click', listener)

  return {
    destroy () {
      jquery(document).off('click', listener)
      isDestroyed = true
    },
    getClicks () {
      if (isDestroyed) return 'Аналитика уничтожена!'
      return counter
    }
  }
}

// @ts-ignore
window.analytics = createAnalytics()
