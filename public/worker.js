document.addEventListener("DOMContentLoaded", function () {
self.addEventListener("push", function (event) {
    const options = {
      body: event.data.text(),
      icon: "icon.png",
    badge: "badge.png",
    image: "image.png",
      actions: [
        {
          action: "open",
          title: "Open",
          icon: "open.png",
        },
      ],
    };
  
    event.waitUntil(
      self.registration.showNotification("Push Notification Example", options)
    );
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 
  
    event.waitUntil(
      clients.openWindow('https://google.com') // Replace with the URL you want to open
    );
  });
});