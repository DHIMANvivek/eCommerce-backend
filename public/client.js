

    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/worker.js")
        .then(function (registration) {
        })
        .catch(function (error) {
          console.error("Service Worker registration failed:", error);
        });
  
      document.getElementById("subscribeBtn").addEventListener("click", function () {
        subscribeUser();
      });
    }
  
  function subscribeUser() {
    navigator.serviceWorker.ready
      .then(function (registration) {
        registration.pushManager
          .getSubscription()
          .then(function (subscription) {
            if (subscription) {
              return subscription.unsubscribe();
            }
          })
          .then(function () {
            return registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });
          })
          .then(function (newSubscription) {
            sendSubscriptionToServer(newSubscription);
          })
          .catch(function (error) {
            console.error("Failed to subscribe the user:", error);
          });
      })
      .catch(function (error) {
        console.error("Service Worker not ready:", error);
      });
  }

  navigator.serviceWorker.ready
  .then(function (registration) {
    registration.pushManager
      .getSubscription()
      .then(function (subscription) {
        if (subscription) {
          subscription.unsubscribe().then(function (successful) {
            if (successful) {
              console.log('Unsubscribed from the previous subscription.');
            } else {
              console.error('Failed to unsubscribe.');
            }
          });
        }
      })
      .catch(function (error) {
        console.error('Error getting subscription:', error);
      });
  })
  .catch(function (error) {
    console.error('Service Worker not ready:', error);
  });

  const publicVapidKey =
    "BHpZMgcqmYkdUWVXuYP0ByYwIkvvcDaYgfPqKjW1hps4fbMNs1uR37kbq-PmJUanYDdeiEgl8lfhMDUu3fXk1KM";
  
  function sendSubscriptionToServer(subscription) {
    fetch("/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Bad status code from the server.");
        }
        return response.json();
      })
      .then(function (responseData) {
        console.log("Server response:", responseData);
      })
      .catch(function (error) {
        console.error("Failed to send subscription to the server:", error);
      });
  }
  
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }