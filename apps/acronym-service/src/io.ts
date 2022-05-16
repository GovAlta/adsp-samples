import {
  AdspId,
  adspId,
  ServiceDirectory,
  TokenProvider,
} from '@govalta/adsp-service-sdk';
import { io } from 'socket.io-client';

export async function handleAcronymUpdate(
  serviceId: AdspId,
  directory: ServiceDirectory,
  tokenProvider: TokenProvider,
  onUpdate: () => void
) {
  const pushServiceUrl = await directory.getServiceUrl(
    adspId`urn:ads:platform:push-service`
  );
  const streamUrl = new URL(`/${serviceId.namespace}`, pushServiceUrl);
  streamUrl.protocol = 'wss';

  const token = await tokenProvider.getAccessToken();
  const socket = io(streamUrl.href, {
    query: {
      stream: 'acronym-updates',
    },
    withCredentials: true,
    extraHeaders: { Authorization: `Bearer ${token}` },
  });

  socket.on('connect', () => {
    console.log(socket.id);
  });

  socket.on('configuration-service:configuration-updated', () => {
    onUpdate();
  });
}
