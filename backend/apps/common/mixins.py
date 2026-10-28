from django.core.exceptions import ImproperlyConfigured
from rest_framework import status
from rest_framework.response import Response


class CreateWithReadSerializerMixin:
    """
    Отдаёт созданный объект в «читающем» представлении.

    Сериализаторы создания намеренно узкие — принимают только то, что клиенту
    разрешено задавать. Из-за этого стандартный ответ CreateModelMixin не
    содержит ни id, ни вычисляемых полей, и клиент не может сразу работать
    с созданным объектом.

    Миксин разделяет схему записи и схему чтения: вход валидирует
    get_serializer_class(), ответ собирает read_serializer_class.
    Бизнес-правила остаются в сериализаторе создания и не дублируются.
    """

    read_serializer_class = None

    def get_read_serializer_class(self):
        if self.read_serializer_class is None:
            raise ImproperlyConfigured(
                f'{self.__class__.__name__} должен задать read_serializer_class '
                f'или переопределить get_read_serializer_class().'
            )
        return self.read_serializer_class

    def create(self, request, *args, **kwargs):
        write_serializer = self.get_serializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        instance = write_serializer.save()

        read_serializer = self.get_read_serializer_class()(
            instance,
            context=self.get_serializer_context(),
        )
        headers = self.get_success_headers(read_serializer.data)

        return Response(
            read_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )
