import { fromString as uint8arrayFromStringFromLib, toString as uint8arrayToStringFromLib } from 'uint8arrays'

/** Convert a Blob to a base64urlpad string.  Note: This function returns a promise.
 * @param {Blob | File} blob The Blob or File to turn into a base64 string
 * @returns {Promise<String>} A promise that resolves to the base64 string
 */
export async function blobToBase64String(blob) {
  let ab = await blob.arrayBuffer()
  return uint8arrayToString(new Uint8Array(ab), 'base64urlpad')
}

/** Convert a base64urlpad string to a Blob.  Note: This function DOES NOT return a promise
 * @param {String} base64String The base64 string that to turn into a Blob
 * @returns {Blob}  A blob that contains the decoded base64 data
 */
export function base64StringToBlob(base64String) {
  return new Blob([uint8arrayFromString(base64String, 'base64urlpad')])
}

/** Convert a Uint8Array to a string.  Supports various encodings.  This is a re-export of https://www.npmjs.com/package/uint8arrays and you can find the list of supported encodings here https://github.com/multiformats/multibase/blob/master/multibase.csv
 * @param {Uint8Array} uint8array The Uint8Array to convert to a string
 * @param {String} encoding The encoding to use when converting the Uint8Array to a string.
 * @returns {String} The string representation of the Uint8Array
 */
export function uint8arrayToString(uint8array, encoding) {
  return uint8arrayToStringFromLib(uint8array, encoding)
}

/** Convert a string to a Uint8Array.  Supports various encodings.  This is a re-export of https://www.npmjs.com/package/uint8arrays and you can find the list of supported encodings here https://github.com/multiformats/multibase/blob/master/multibase.csv
 * @param {String} str The string to convert to a Uint8Array
 * @param {String} encoding The encoding to use when converting the string to a Uint8Array.
 * @returns {String} The Uint8Array representation of the data from the string
 */
export function uint8arrayFromString(str, encoding) {
  return uint8arrayFromStringFromLib(str, encoding)
}

/**
 * Convert a file to a data URL, which could then be embedded in a LIT.  A data URL is a string representation of a file.
 * @param {File} file The file to turn into a data url
 * @returns {Promise<unknown>} The data URL.  This is a string representation that can be used anywhere the original file would be used.
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Download a file in memory to the user's computer
 * @param {Object} params
 * @param {string} params.filename The name of the file
 * @param {Uint8Array} params.data The actual file itself as a Uint8Array
 * @param {string} params.mimetype The mime type of the file
 * @returns {string} The data URL.  This is a string representation that can be used anywhere the original file would be used.
 */
export function downloadFile({ filename, data, mimetype }) {
  var element = document.createElement('a')
  element.setAttribute('href', 'data:' + mimetype + ';base64,' + uint8arrayToString(data, 'base64'))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

/**
 * Inject an iFrame into the current page that will display a LIT.  This function safely sandboxes the content in the iFrame so that the LIT cannot see cookies or localStorage of the parent website.
 * @param {Object} params
 * @param {Object} params.destinationId The DOM ID of the element to inject the iFrame into
 * @param {string} params.title The title of the content being displayed
 * @param {string} params.fileUrl The URL of the content that will be shown in the iFrame
 * @param {string} params.className An optional DOM class name to add to the iFrame for styling
 */
export function injectViewerIFrame({ destinationId, title, fileUrl, className }) {
  if (fileUrl.includes('data:')) {
    // data urls are not safe, refuse to do this
    throw new Error('You can not inject an iFrame with a data url.  Try a regular https URL.')
  }

  const url = new URL(fileUrl)
  if (url.host.toLowerCase() === window.location.host.toLowerCase()) {
    throw new Error(
      'You cannot host a LIT on the same domain as the parent webpage.  This is because iFrames with the same origin have access to localstorage and cookies in the parent webpage which is unsafe',
    )
  }

  const iframe = document.createElement('iframe')
  iframe.src = fileUrl
  iframe.title = title
  iframe.sandbox =
    'allow-forms allow-scripts allow-popups  allow-modals allow-popups-to-escape-sandbox allow-same-origin'
  iframe.loading = 'lazy'
  iframe.allow =
    'accelerometer; ambient-light-sensor; autoplay; battery; camera; display-capture; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr; screen-wake-lock; web-share; xr-spatial-tracking'
  if (className) {
    iframe.className = className
  }
  document.getElementById(destinationId).appendChild(iframe)
}
