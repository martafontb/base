const initLazyLoad = () => {
  const options = {
    root: null,
    rootMargin: "0px 0px 0px 0px",
    threshold: [0.5, 1.0],
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const { target, isIntersecting } = entry;
      const { animate } = target.dataset;
      isIntersecting && target.classList.add('in-view');
      animate && setTimeout(() => target.classList.remove('in-view'), Number(animate))
    })
  }, options);

  document.querySelectorAll('img[loading="lazy"]').forEach(el => {
    const isLoaded = el.complete && el.naturalHeight !== 0;
    isLoaded ? observer.observe(el) : (el.onload = () => observer.observe(el));
  });

  document.querySelectorAll('video.lazy').forEach(el => observer.observe(el));

  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  })
}

document.addEventListener('shopify:section:load', initLazyLoad);

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    document.body.classList.add('ready');

    initLazyLoad();
    window.initLazyLoad = initLazyLoad;
  }
};