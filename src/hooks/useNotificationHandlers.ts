import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

export const useNotificationHandlers = () => {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);

        const data = response.notification.request.content.data;
        handleNotificationNavigation(data, router);
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);
};

function handleNotificationNavigation(data: any, router: any) {
  if (!data) return;

  switch (data.screen) {
    case 'LessonDetails':
      if (data.lessonId) {
        router.push({
          pathname: '/(tabs)/learning',
          params: { lessonId: data.lessonId }
        });
      }
      break;

    case 'Practice':
      router.push('/(tabs)/practice');
      break;

    case 'MockExam':
      router.push('/(tabs)/mockexam');
      break;

    case 'Subscription':
      router.push('/subscriptions');
      break;

    default:
      router.push('/(tabs)');
      break;
  }
}
