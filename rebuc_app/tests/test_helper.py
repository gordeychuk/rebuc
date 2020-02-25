from random import choice, randint, getrandbits
from string import ascii_letters, punctuation, digits, whitespace
from django.utils import timezone


class TestHelper:
    """
    This class contains various methods for tests
    """
    @staticmethod
    def random_str(length):
        """
        Method will generate and return random string with givel length. All special chars are included.
        :param length: length of the string
        :return: generated string
        """
        return ''.join(choice(ascii_letters + punctuation + digits) for x in range(length))

    def random_build_name(self, length):
        """
        Method will generate and return random instance-like value with given octets length.
        :param length: length of the octets
        :return: generated string
        """
        return '.'.join(str(self.random_int(randint(1, 3))) for _ in range(length))

    @staticmethod
    def random_ascii_str(length):
        """
        Method will generate and return random string with givel length. Special chars are not included.
        :param length: length of the string
        :return: generated string
        """
        return ''.join(choice(ascii_letters + digits + whitespace) for x in range(length))

    @staticmethod
    def random_int(length):
        """
        Method will generate and return random int with givel length (for example 1234 has length = 4).
        :param length: length of the int
        :return: generated int
        """
        range_start = 10 ** (length - 1)
        range_end = (10 ** length) - 1
        return randint(range_start, range_end)

    @staticmethod
    def random_bool():
        """
        Methon will generate random bool value (True of False)
        :return: True or False
        """
        return bool(getrandbits(1))

    def random_date(self):
        """
        Methon will generate random date value
        :return: date value
        """
        return timezone.datetime.fromtimestamp(self.random_int(8)).date()

    def random_datetime(self):
        """
        Methon will generate random datetime value
        :return: datetime value
        """
        return timezone.datetime.fromtimestamp(self.random_int(8), tz=timezone.get_current_timezone())

    def random_ip_url(self):
        """
        Method will generate random ip url
        :return: url as string
        """
        random_https = bool(getrandbits(1))
        if random_https:
            prefix = 'http://'
        else:
            prefix = 'https://'

        ip0 = str(randint(0, 255))
        ip1 = str(randint(0, 255))
        ip2 = str(randint(0, 255))
        ip3 = str(randint(0, 255))
        return prefix + ip0 + '.' + ip1 + '.' + ip2 + '.' + ip3 + '/' + self.random_str(50)

    def random_url(self):
        """
        Method will generate random str url
        :return: url as string
        """
        random_https = bool(getrandbits(1))
        if random_https:
            prefix = 'http://'
            subpage = self.random_str(41)
        else:
            prefix = 'https://'
            subpage = self.random_str(40)

        domain1 = self.random_str(10)
        domain2 = self.random_str(10)
        domain3 = self.random_str(10)
        domain4 = self.random_str(10)
        return prefix + domain1 + '.' + domain2 + '.' + domain3 + '.' + domain4 + '/' + subpage

    def random_email(self):
        """
        Method will generate random email str
        :return: email as str
        """
        email_user = self.random_ascii_str(200)
        email_domain = self.random_ascii_str(48)
        email_literal = self.random_ascii_str(4)
        return (email_user + '@' + email_domain + '.' + email_literal).lower()

