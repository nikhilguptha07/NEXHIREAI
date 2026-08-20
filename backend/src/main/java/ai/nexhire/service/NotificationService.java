package ai.nexhire.service;

import ai.nexhire.dto.NotificationDto;
import ai.nexhire.entity.Notification;
import ai.nexhire.entity.User;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.NotificationMapper;
import ai.nexhire.repository.NotificationRepository;
import ai.nexhire.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            NotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationMapper = notificationMapper;
    }

    @Transactional
    public void createNotification(User recipient, String title, String message, String type, String link) {
        if (recipient == null) return;
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type != null ? type : "INFO")
                .link(link)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDto markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Notification not found."));

        notification.setReadAt(Instant.now());
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toDto(saved);
    }
}
