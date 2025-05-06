import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { config } from 'process';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/auth.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
  [id: string]: { socket: Socket; user: User };
}

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');

    Object.values(this.connectedClients).forEach((i) => {
      console.log(i.user.fullname);
      if (i.user.id === id) {
        throw new Error('User already connected');
      }
    });

    this.connectedClients[client.id] = { socket: client, user };
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients).map((key) => {
      const { user } = this.connectedClients[key];
      return user.fullname;
    });
  }
  getFullName(clientId: string): string {
    return this.connectedClients[clientId].user.fullname;
  }
}
