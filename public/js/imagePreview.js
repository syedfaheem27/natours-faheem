/*eslint-disable*/

export const previewImage = (inputEl, previewSelector) => {
  const preview = document.querySelector(previewSelector);
  const fileReader = new FileReader();
  const files = inputEl.files;

  fileReader.addEventListener("load", event => {
    preview.setAttribute("src", event.target.result);
  });

  if (files) {
    fileReader.readAsDataURL(files[0]);
  }
};
